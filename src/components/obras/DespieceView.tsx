import { useState } from "react";
import { Tabs, Tab, Chip, Divider } from "@heroui/react";
import {
  Layers,
  Wrench,
  Grid2x2,
  BarChart3,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { formatMm, formatPesos } from "@/lib/calculoDespiece";
import type { ResultadoDespiece } from "@/lib/motorDespiece";
import { useOpciones } from "@/hooks/catalogo/useOpciones";

interface Props {
  resultado: ResultadoDespiece;
  titulo?: string;
}

const NIVEL_COLOR: Record<string, string> = {
  Marco: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  Hoja: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  "Contravid. Int.":
    "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  "Contravid. Ext.":
    "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300",
  Cruces:
    "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300",
  Interior: "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300",
};

const nivelChip = (n: string) => (
  <span
    className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${NIVEL_COLOR[n] ?? "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400"}`}
  >
    {n}
  </span>
);

export default function DespieceView({ resultado, titulo }: Props) {
  const [view, setView] = useState<"detalle" | "resumen">("resumen");
  const { data: opciones } = useOpciones();

  if (!opciones) return <div>Loading...</div>;

  // 🌟 Desestructuración adaptada al snake_case estricto del motor
  const {
    cortes,
    interiores,
    resumenes,
    costo_perfiles,
    costo_interiores,
    multiplicador,
    contexto,
  } = resultado;

  // Los accesorios ahora viajan como cortes de nivel "Cruces" o están contemplados en el costo perimetral.
  // Mantenemos la variable en 0 o mapeada si se extiende en un futuro.
  const costoAccesoriosEfectivo = 0;

  // Aplicación de márgenes comerciales parametrizados
  const margenPerf = 1 + (opciones?.porcentaje_sobre_perfiles / 100 || 0);
  const margenAcc = 1 + (opciones?.porcentaje_sobre_accesorios / 100 || 0);
  const margenVid = 1 + (opciones?.porcentaje_sobre_vidrios / 100 || 0);
  const iva = 1 + (opciones?.iva / 100 || 0);

  const subtotal =
    costo_perfiles * margenPerf +
    costoAccesoriosEfectivo * margenAcc +
    costo_interiores * margenVid;
  const totalConIva = subtotal * iva;

  const totalKg = resumenes.reduce((s, r) => s + r.kg, 0);
  const totalTiras = resumenes.reduce((s, r) => s + r.tiras, 0);

  return (
    <div className="space-y-4">
      {/* ── Banner de Contexto de Manufactura ── */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
        {titulo && (
          <span className="font-semibold text-stone-700 dark:text-stone-200">
            {titulo}
          </span>
        )}
        <Chip size="sm" variant="flat">
          ×{multiplicador} unidad{multiplicador !== 1 ? "es" : ""}
        </Chip>
        <span className="font-mono">
          {contexto.ancho} × {contexto.alto} mm
        </span>
        <span>·</span>
        <span>
          {contexto.hojas} hoja{contexto.hojas !== 1 ? "s" : ""}
        </span>
        {(contexto.cruces_h > 0 || contexto.cruces_v > 0) && (
          <span>
            · {contexto.cruces_h}H + {contexto.cruces_v}V cruces
          </span>
        )}
      </div>

      {/* ── Tarjetas de Resumen de Costos Metrados ── */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <SummaryCard
          icon={<Layers className="w-4 h-4 text-blue-500" />}
          label="Perfiles"
          sub={`${totalKg.toFixed(2)} kg · ${totalTiras} tira${totalTiras !== 1 ? "s" : ""}`}
          value={formatPesos(costo_perfiles * margenPerf)}
        />
        <SummaryCard
          icon={<Wrench className="w-4 h-4 text-emerald-500" />}
          label="Accesorios"
          sub="Calculados en despiece"
          value={formatPesos(costoAccesoriosEfectivo * margenAcc)}
        />
        <SummaryCard
          icon={<Grid2x2 className="w-4 h-4 text-amber-500" />}
          label="Vidrios / Int."
          sub={`${interiores.length} pieza${interiores.length !== 1 ? "s" : ""}`}
          value={formatPesos(costo_interiores * margenVid)}
        />
        <SummaryCard
          icon={<TrendingUp className="w-4 h-4 text-stone-500" />}
          label={`Total + IVA ${opciones.iva}%`}
          sub="Con márgenes aplicados"
          value={formatPesos(totalConIva)}
          highlight
        />
      </div>

      <Divider />

      {/* ── Pestañas de Visualización Operativa ── */}
      <Tabs
        selectedKey={view}
        onSelectionChange={(k: React.Key) =>
          setView(k as "detalle" | "resumen")
        }
        size="sm"
        variant="underlined"
        classNames={{
          tabList:
            "border-b border-stone-200 dark:border-stone-700 w-full gap-0",
          cursor: "bg-stone-600 dark:bg-stone-400 h-0.5",
          tab: "px-4 h-8 text-xs font-medium",
        }}
      >
        {/* ── VISTA RESUMEN: Agrupación por barras óptimas ── */}
        <Tab
          key="resumen"
          title={
            <span className="flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5" /> Resumen optimizado
            </span>
          }
        >
          <div className="pt-4 space-y-4">
            {resumenes.length > 0 && (
              <section>
                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-2">
                  Consolidado de Aluminio
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-stone-200 dark:border-stone-700">
                        <Th>Perfil</Th>
                        <Th right>Cortes</Th>
                        <Th right>Total Metros</Th>
                        <Th right>Tiras (6m)</Th>
                        <Th right>Efic.</Th>
                        <Th right>Peso Kg</Th>
                        <Th right>Total Neto</Th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                      {resumenes.map((r) => (
                        <tr
                          key={r.nro_perfil}
                          className="hover:bg-stone-50 dark:hover:bg-stone-800/30"
                        >
                          <td className="py-2 pr-3">
                            <span className="font-mono font-semibold text-stone-700 dark:text-stone-300">
                              {r.nro_perfil}
                            </span>
                            <span className="text-stone-400 ml-2 text-[10px]">
                              {r.descripcion_perfil}
                            </span>
                          </td>
                          <Td right mono>
                            {r.total_cortes}
                          </Td>
                          <Td right mono>
                            {(r.total_mm / 1000).toFixed(2)} m
                          </Td>
                          <Td right mono>
                            {r.tiras}
                          </Td>
                          <Td right>
                            <EficienciaChip v={r.eficiencia} />
                          </Td>
                          <Td right mono>
                            {r.kg.toFixed(3)}
                          </Td>
                          <Td right bold>
                            {formatPesos(r.precio_total * margenPerf)}
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-stone-300 dark:border-stone-600 font-semibold">
                        <td className="py-2 text-xs text-stone-500">TOTALES</td>
                        <td />
                        <td className="text-right font-mono text-xs py-2">
                          {(
                            resumenes.reduce((s, r) => s + r.total_mm, 0) / 1000
                          ).toFixed(2)}{" "}
                          m
                        </td>
                        <td className="text-right font-mono text-xs py-2">
                          {totalTiras}
                        </td>
                        <td />
                        <td className="text-right font-mono text-xs py-2">
                          {totalKg.toFixed(3)}
                        </td>
                        <td className="text-right font-semibold text-sm py-2">
                          {formatPesos(costo_perfiles * margenPerf)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </section>
            )}

            {/* Interiores / Vidrios / Revestimientos */}
            {interiores.length > 0 && (
              <section>
                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-2">
                  Paños y Rellenos de Estructura
                </p>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 dark:border-stone-700">
                      <Th>Ubicación / Módulo</Th>
                      <Th>Tipo</Th>
                      <Th right>Ancho</Th>
                      <Th right>Alto</Th>
                      <Th right>Área</Th>
                      <Th right>Costo Neto</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                    {interiores.map((i, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-stone-50 dark:hover:bg-stone-800/30"
                      >
                        <td className="py-1.5 pr-3 font-medium text-stone-600 dark:text-stone-400">
                          {i.modulo ?? `Paño ${idx + 1}`}
                        </td>
                        <td className="py-1.5 pr-3">
                          <IntTipoChip tipo={i.tipo} />
                        </td>
                        <Td right mono>
                          {formatMm(i.ancho)}
                        </Td>
                        <Td right mono>
                          {formatMm(i.alto)}
                        </Td>
                        <Td right mono>
                          {i.area.toFixed(3)} m²
                        </Td>
                        <Td right bold>
                          {i.precio > 0
                            ? formatPesos(i.precio * margenVid)
                            : "—"}
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}

            {/* Desglose Analítico Final */}
            <div className="bg-stone-50 dark:bg-stone-800/50 rounded-xl p-4 space-y-2">
              <PriceLine
                label={`Subtotal Perfiles (Margen ${opciones.porcentaje_sobre_perfiles}%)`}
                value={costo_perfiles * margenPerf}
              />
              <PriceLine
                label={`Subtotal Vidrios / Componentes (Margen ${opciones.porcentaje_sobre_vidrios}%)`}
                value={costo_interiores * margenVid}
              />
              <Divider className="my-1" />
              <PriceLine label="Subtotal Comercial" value={subtotal} />
              <PriceLine
                label={`IVA Inscripto (${opciones.iva}%)`}
                value={subtotal * (iva - 1)}
              />
              <Divider className="my-1" />
              <PriceLine label="TOTAL PRESUPUESTO" value={totalConIva} big />
            </div>
          </div>
        </Tab>

        {/* ── VISTA DETALLE: Listado de cortes individuales para taller ── */}
        <Tab
          key="detalle"
          title={
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" /> Planilla de Cortes
            </span>
          }
        >
          <div className="pt-4 overflow-x-auto">
            {cortes.length === 0 ? (
              <div className="text-center py-8 text-stone-400">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">
                  Sin cortes calculados para esta tipología
                </p>
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-stone-700">
                    <Th>Ubicación</Th>
                    <Th>Código Perfil</Th>
                    <Th right>Cant.</Th>
                    <Th right>Medida Corte</Th>
                    <Th right>Total m</Th>
                    <Th>Ángulos</Th>
                    <Th right>Peso (Kg)</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {cortes.map((c) => (
                    <tr
                      key={c.id}
                      className="hover:bg-stone-50 dark:hover:bg-stone-800/30"
                    >
                      <td className="py-1.5 pr-2">{nivelChip(c.nivel)}</td>
                      <td className="py-1.5 pr-3">
                        <span className="font-mono font-semibold text-stone-700 dark:text-stone-300">
                          {c.nro_perfil}
                        </span>
                        <span className="text-stone-400 ml-1.5 text-[10px]">
                          {c.descripcion_perfil}
                        </span>
                      </td>
                      <Td right mono>
                        {c.cantidad}
                      </Td>
                      <Td right mono>
                        {formatMm(c.medida_mm)}
                      </Td>
                      <Td right mono>
                        {(c.total_mm / 1000).toFixed(3)} m
                      </Td>
                      <td className="py-1.5 px-2">
                        <span className="font-mono text-[10px] text-stone-500 bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded">
                          {c.angulo}
                        </span>
                      </td>
                      <Td right mono>
                        {c.kg.toFixed(3)}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}

// ── Sub-componentes Internos Modulares ──────────────────────────────────────────

function SummaryCard({
  icon,
  label,
  sub,
  value,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`border rounded-xl p-3 space-y-1 bg-white dark:bg-stone-900 ${highlight ? "border-stone-400 dark:border-stone-500" : "border-stone-200 dark:border-stone-800"}`}
    >
      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-stone-500 uppercase tracking-wide">
        {icon} {label}
      </div>
      <p
        className={`font-semibold tabular-nums ${highlight ? "text-base" : "text-sm"} text-stone-800 dark:text-stone-100`}
      >
        {value}
      </p>
      <p className="text-[10px] text-stone-400">{sub}</p>
    </div>
  );
}

function PriceLine({
  label,
  value,
  big = false,
}: {
  label: string;
  value: number;
  big?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span
        className={`text-xs ${big ? "font-semibold text-stone-700 dark:text-stone-200" : "text-stone-500"}`}
      >
        {label}
      </span>
      <span
        className={`font-mono ${big ? "text-base font-bold text-stone-800 dark:text-stone-100" : "text-xs text-stone-700 dark:text-stone-300"}`}
      >
        {formatPesos(value)}
      </span>
    </div>
  );
}

function EficienciaChip({ v }: { v: number }) {
  const pct = Math.round(v * 100);
  const color =
    v >= 0.85
      ? "text-emerald-600 font-bold"
      : v >= 0.7
        ? "text-amber-600 font-medium"
        : "text-red-500 font-medium";
  return <span className={`font-mono text-[10px] ${color}`}>{pct}%</span>;
}

function IntTipoChip({
  tipo,
}: {
  tipo: "Vidrio" | "Revestimiento" | "CV Int." | "CV Ext." | "VR" | string;
}) {
  const map: Record<string, string> = {
    Vidrio: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
    Revestimiento:
      "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300",
    "CV Int.":
      "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
    "CV Ext.":
      "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400",
    VR: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400",
  };
  return (
    <span
      className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${map[tipo] ?? "bg-stone-100 text-stone-600"}`}
    >
      {tipo}
    </span>
  );
}

function Th({
  children,
  right,
}: {
  children?: React.ReactNode;
  right?: boolean;
}) {
  return (
    <th
      className={`pb-2 text-[10px] font-semibold text-stone-400 uppercase tracking-wide whitespace-nowrap ${right ? "text-right" : "text-left"} pr-3`}
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
      className={`py-1.5 pr-3 whitespace-nowrap ${right ? "text-right" : ""} ${mono ? "font-mono" : ""} ${bold ? "font-semibold" : ""}`}
    >
      {children}
    </td>
  );
}
