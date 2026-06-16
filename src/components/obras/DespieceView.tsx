import { Tabs, Tab, Divider, Spinner } from "@heroui/react";
import {
  Layers,
  Grid2x2,
  BarChart3,
  AlertCircle,
  Wrench,
  HardHat,
  Package,
} from "lucide-react";
import { formatMm, formatPesos } from "@/lib/calculoDespiece";
import type { ResultadoDespiece, ItemAccesorio } from "@/lib/motorDespiece";
import { useOpciones } from "@/hooks/catalogo/useOpciones";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Props {
  resultado: ResultadoDespiece;
  titulo?: string;
}

// Columnas de precio idénticas al Access original
interface FilaPrecios {
  label: string;
  costo: number; // Sin IVA, sin ganancia
  conIva: number; // + IVA
  conGanancia: number; // + IVA + Ganancia
  color: string; // Para el gráfico de dona
  pct?: number; // Porcentaje del total (calculado)
}

// ─── Chip de nivel (ubicación) ───────────────────────────────────────────────

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
  // Niveles exclusivos de accesorios
  Contravidrio:
    "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
};

const nivelChip = (n: string) => (
  <span
    className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
      NIVEL_COLOR[n] ??
      "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400"
    }`}
  >
    {n}
  </span>
);

// ─── Colores del gráfico (igual al Access) ───────────────────────────────────
const COLOR_PERFILES = "#3b82f6"; // azul
const COLOR_ACCESORIOS = "#22c55e"; // verde
const COLOR_VIDRIOS = "#ef4444"; // rojo
const COLOR_MO = "#f59e0b"; // amarillo

// ─── Componente Principal ────────────────────────────────────────────────────

export default function DespieceView({ resultado, titulo }: Props) {
  const { data: opciones } = useOpciones();

  if (!opciones) {
    return (
      <div className="h-48 flex items-center justify-center">
        <Spinner color="amber" label="Cargando configuración de costos..." />
      </div>
    );
  }

  const {
    cortes = [],
    interiores = [],
    accesorios = [],
    resumenes = [],
    costo_perfiles = 0,
    costo_interiores = 0,
    costo_accesorios = 0,
    costo_mo_taller = 0,
    costo_mo_colocacion = 0,
    multiplicador = 1,
    contexto = { ancho: 0, alto: 0, hojas: 0, cruces_h: 0, cruces_v: 0 },
  } = resultado || {};

  // ── Factores de margen (porcentaje sobre cada rubro, igual que Access) ──────
  // En Access: precio_con_ganancia = precio_base * (1 + porcentaje/100)
  const pctPerf = (opciones.porcentaje_sobre_perfiles ?? 0) / 100;
  const pctVid = (opciones.porcentaje_sobre_vidrios ?? 0) / 100;
  const pctAcc = (opciones.porcentaje_sobre_accesorios ?? 0) / 100;
  const pctMano = (opciones.porcentaje_sobre_mano ?? 0) / 100;
  const pctColo = (opciones.porcentaje_sobre_mano_colocacion ?? 0) / 100;
  const ivaPct = (opciones.iva ?? 0) / 100;

  // ── Calcular MO Taller desde opciones si el motor no la provee ──────────────
  // Igual que Access: Horas × costo_hora_taller
  const costoHoraTaller = opciones.costo_hora_taller ?? 0;

  const horasMarco =
    (opciones.tiempo_marco_horas ?? 0) +
    (opciones.tiempo_marco_minutos ?? 0) / 60;
  const horasHoja =
    (opciones.tiempo_hoja_horas ?? 0) +
    (opciones.tiempo_hoja_minutos ?? 0) / 60;
  const horasInt =
    (opciones.tiempo_interior_horas ?? 0) +
    (opciones.tiempo_interior_minutos ?? 0) / 60;
  const horasCruce =
    (opciones.tiempo_cruce_horas ?? 0) +
    (opciones.tiempo_cruce_minutos ?? 0) / 60;
  const horasCV =
    (opciones.tiempo_contravidrio_horas ?? 0) +
    (opciones.tiempo_contravidrio_minutos ?? 0) / 60;

  // Cantidad de cada elemento (ya viene multiplicado por tipologías en el motor)
  const cantMarcos = cortes
    .filter((c) => c.nivel === "Marco")
    .reduce((s, c) => s + c.cantidad, 0);
  const cantHojas = cortes
    .filter((c) => c.nivel === "Hoja")
    .reduce((s, c) => s + c.cantidad, 0);
  const cantInt = interiores.length;
  const cantCruces = cortes
    .filter((c) => c.nivel === "Cruces")
    .reduce((s, c) => s + c.cantidad, 0);
  const cantCV = cortes
    .filter((c) => c.nivel.startsWith("Contravid"))
    .reduce((s, c) => s + c.cantidad, 0);

  const moTallerCalculado =
    costo_mo_taller > 0
      ? costo_mo_taller
      : (horasMarco * cantMarcos * costoHoraTaller +
          horasHoja * cantHojas * costoHoraTaller +
          horasInt * cantInt * costoHoraTaller +
          horasCruce * cantCruces * costoHoraTaller +
          horasCV * cantCV * costoHoraTaller) *
        multiplicador;

  const moColocacion = costo_mo_colocacion ?? 0;

  // ── Tabla de precios idéntica a Access: 3 columnas ──────────────────────────
  // Columna 1: Costo sin IVA (fabricación)
  // Columna 2: Costo + IVA
  // Columna 3: Costo + IVA + Ganancia
  //
  // En Access:
  //   costo        = valor base
  //   con_iva      = costo × (1 + iva)
  //   con_ganancia = costo × (1 + porcentaje_rubro) × (1 + iva)

  const filas: FilaPrecios[] = [
    {
      label: "Perfiles natural",
      costo: costo_perfiles,
      conIva: costo_perfiles * (1 + ivaPct),
      conGanancia: costo_perfiles * (1 + pctPerf) * (1 + ivaPct),
      color: COLOR_PERFILES,
    },
    {
      label: "Tratamientos",
      costo: 0,
      conIva: 0,
      conGanancia: 0,
      color: "#94a3b8",
    },
    {
      label: "Accesorios",
      costo: costo_accesorios,
      conIva: costo_accesorios * (1 + ivaPct),
      conGanancia: costo_accesorios * (1 + pctAcc) * (1 + ivaPct),
      color: COLOR_ACCESORIOS,
    },
    {
      label: "Vidrios / Interiores",
      costo: costo_interiores,
      conIva: costo_interiores * (1 + ivaPct),
      conGanancia: costo_interiores * (1 + pctVid) * (1 + ivaPct),
      color: COLOR_VIDRIOS,
    },
    {
      label: "Telas",
      costo: 0,
      conIva: 0,
      conGanancia: 0,
      color: "#a78bfa",
    },
    {
      label: "M.O. Taller",
      costo: moTallerCalculado,
      conIva: moTallerCalculado * (1 + ivaPct),
      conGanancia: moTallerCalculado * (1 + pctMano) * (1 + ivaPct),
      color: COLOR_MO,
    },
    {
      label: "M.O. Colocación",
      costo: moColocacion,
      conIva: moColocacion * (1 + ivaPct),
      conGanancia: moColocacion * (1 + pctColo) * (1 + ivaPct),
      color: "#fb923c",
    },
    {
      label: "Ítems manuales",
      costo: 0,
      conIva: 0,
      conGanancia: 0,
      color: "#64748b",
    },
  ];

  const totalCosto = filas.reduce((s, f) => s + f.costo, 0);
  const totalConIva = filas.reduce((s, f) => s + f.conIva, 0);
  const totalConGanancia = filas.reduce((s, f) => s + f.conGanancia, 0);

  // Porcentajes para el gráfico de dona (sobre costo sin IVA)
  const filasConPct = filas.map((f) => ({
    ...f,
    pct: totalCosto > 0 ? (f.costo / totalCosto) * 100 : 0,
  }));

  const totalKg = resumenes.reduce((s, r) => s + (r.kg || 0), 0);
  const totalTiras = resumenes.reduce((s, r) => s + (r.tiras || 0), 0);

  return (
    <div className="space-y-4">
      {/* ── Banner de contexto ── */}
      {titulo && (
        <p className="text-xs font-semibold text-stone-700 dark:text-stone-200">
          {titulo}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
        <span className="font-mono">
          {contexto.ancho} × {contexto.alto} mm
        </span>
        <span>·</span>
        <span>
          {contexto.hojas} hoja{contexto.hojas !== 1 ? "s" : ""}
        </span>
        <span>·</span>
        <span>
          ×{multiplicador} tipología{multiplicador !== 1 ? "s" : ""}
        </span>
        {(contexto.cruces_h > 0 || contexto.cruces_v > 0) && (
          <>
            <span>·</span>
            <span>
              {contexto.cruces_h}H + {contexto.cruces_v}V cruces
            </span>
          </>
        )}
      </div>

      <Divider />

      {/* ── Cuerpo principal: tabla + gráfico (igual al Access) ── */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* ── Tabla de precios (3 columnas) ── */}
        <div className="flex-1 min-w-0">
          <div className="overflow-x-auto rounded-lg border border-stone-200 dark:border-stone-700">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-stone-100 dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700">
                  <Th>Rubro</Th>
                  <Th right>Costo sin IVA</Th>
                  <Th right>Costo + IVA</Th>
                  <Th right>Costo + IVA + Ganancia</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {filasConPct.map((f) => (
                  <tr
                    key={f.label}
                    className={`hover:bg-stone-50 dark:hover:bg-stone-800/30 ${
                      f.costo === 0 ? "opacity-50" : ""
                    }`}
                  >
                    <td className="py-2 pl-3 pr-2 flex items-center gap-2">
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: f.color }}
                      />
                      <span className="text-stone-700 dark:text-stone-300">
                        {f.label}
                      </span>
                    </td>
                    <Td right mono>
                      {f.costo > 0 ? formatPesos(f.costo) : "$0.00"}
                    </Td>
                    <Td right mono>
                      {f.conIva > 0 ? formatPesos(f.conIva) : "$0.00"}
                    </Td>
                    <Td right mono bold>
                      {f.conGanancia > 0 ? formatPesos(f.conGanancia) : "$0.00"}
                    </Td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-stone-50 dark:bg-stone-800/60 border-t-2 border-stone-300 dark:border-stone-600 font-bold">
                  <td className="py-2.5 pl-3 text-stone-700 dark:text-stone-200">
                    Total
                  </td>
                  <Td right mono bold>
                    {formatPesos(totalCosto)}
                  </Td>
                  <Td right mono bold>
                    {formatPesos(totalConIva)}
                  </Td>
                  <Td right mono bold>
                    <span className="text-sm text-stone-900 dark:text-white">
                      {formatPesos(totalConGanancia)}
                    </span>
                  </Td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* ── Gráfico de dona (igual al Access) ── */}
        <div className="flex-shrink-0 flex flex-col items-center gap-3">
          <DonaChart filas={filasConPct} />
          {/* Leyenda */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {filasConPct
              .filter((f) => f.costo > 0)
              .map((f) => (
                <div
                  key={f.label}
                  className="flex items-center gap-1.5 text-[10px] text-stone-600 dark:text-stone-400"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: f.color }}
                  />
                  <span>{f.label}</span>
                  <span className="font-mono text-stone-400">
                    {f.pct!.toFixed(1)}%
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>

      <Divider />

      {/* ── Pestañas: Planilla de cortes + Vidrios ── */}
      <Tabs
        size="sm"
        variant="underlined"
        classNames={{
          tabList:
            "border-b border-stone-200 dark:border-stone-700 w-full gap-0",
          cursor: "bg-stone-600 dark:bg-stone-400 h-0.5",
          tab: "px-4 h-8 text-xs font-medium",
        }}
      >
        {/* ── PLANILLA DE CORTES (pestaña 1) ── */}
        <Tab
          key="cortes"
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
                <p className="text-sm">Sin cortes calculados</p>
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-stone-700">
                    <Th>Ubicación</Th>
                    <Th>Código</Th>
                    <Th>Descripción</Th>
                    <Th right>Cant.</Th>
                    <Th right>Medida (mm)</Th>
                    <Th right>Total (m)</Th>
                    <Th>Ángulos</Th>
                    <Th right>Peso (kg)</Th>
                    <Th right>Costo</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {cortes.map((c) => (
                    <tr
                      key={c.id}
                      className="hover:bg-stone-50 dark:hover:bg-stone-800/30"
                    >
                      <td className="py-1.5 pr-2">{nivelChip(c.nivel)}</td>
                      <td className="py-1.5 pr-3 font-mono font-semibold text-stone-700 dark:text-stone-300">
                        {c.nro_perfil}
                      </td>
                      <td className="py-1.5 pr-3 text-stone-400 text-[10px]">
                        {c.descripcion_perfil}
                      </td>
                      <Td right mono>
                        {c.cantidad}
                      </Td>
                      <Td right mono>
                        {formatMm(c.medida_mm)}
                      </Td>
                      <Td right mono>
                        {((c.total_mm || 0) / 1000).toFixed(3)} m
                      </Td>
                      <td className="py-1.5 px-2">
                        <span className="font-mono text-[10px] text-stone-500 bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded">
                          {c.angulo}
                        </span>
                      </td>
                      <Td right mono>
                        {(c.kg || 0).toFixed(3)}
                      </Td>
                      <Td right mono>
                        {formatPesos(c.precio_total || 0)}
                      </Td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-stone-300 dark:border-stone-600 font-semibold text-xs">
                    <td colSpan={3} className="py-2 text-stone-500">
                      TOTALES
                    </td>
                    <td />
                    <td />
                    <td className="text-right font-mono py-2">
                      {(
                        resumenes.reduce((s, r) => s + (r.total_mm || 0), 0) /
                        1000
                      ).toFixed(2)}{" "}
                      m
                    </td>
                    <td />
                    <td className="text-right font-mono py-2">
                      {totalKg.toFixed(3)}
                    </td>
                    <td className="text-right font-mono py-2">
                      {formatPesos(costo_perfiles)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        </Tab>

        {/* ── VIDRIOS / INTERIORES (pestaña 2) ── */}
        <Tab
          key="interiores"
          title={
            <span className="flex items-center gap-1.5">
              <Grid2x2 className="w-3.5 h-3.5" /> Vidrios / Interiores
            </span>
          }
        >
          <div className="pt-4 overflow-x-auto">
            {interiores.length === 0 ? (
              <div className="text-center py-8 text-stone-400">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Sin interiores calculados</p>
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-stone-700">
                    <Th>Módulo</Th>
                    <Th>Tipo</Th>
                    <Th right>Cant.</Th>
                    <Th right>Ancho (mm)</Th>
                    <Th right>Alto (mm)</Th>
                    <Th right>Área (m²)</Th>
                    <Th right>Precio m²</Th>
                    <Th right>Costo</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {interiores.map((item, idx) => {
                    const areaM2 = (item.ancho / 1000) * (item.alto / 1000);
                    const precioM2 = areaM2 > 0 ? item.precio / areaM2 : 0;
                    return (
                      <tr
                        key={idx}
                        className="hover:bg-stone-50 dark:hover:bg-stone-800/30"
                      >
                        <td className="py-1.5 pr-3 text-stone-500">
                          {item.modulo ?? `Paño ${idx + 1}`}
                        </td>
                        <td className="py-1.5 pr-3">
                          <IntTipoChip tipo={item.tipo} />
                        </td>
                        <Td right mono>
                          {item.cantidad}
                        </Td>
                        <Td right mono>
                          {item.ancho.toFixed(1)}
                        </Td>
                        <Td right mono>
                          {item.alto.toFixed(1)}
                        </Td>
                        <Td right mono>
                          {/* Conversión mm → m²: (ancho_mm/1000) × (alto_mm/1000) */}
                          {areaM2.toFixed(4)}
                        </Td>
                        <Td right mono>
                          {precioM2 > 0 ? formatPesos(precioM2) : "—"}
                        </Td>
                        <Td right mono bold>
                          {item.precio > 0 ? formatPesos(item.precio) : "—"}
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-stone-300 dark:border-stone-600 font-semibold text-xs">
                    <td colSpan={5} className="py-2 text-stone-500">
                      TOTAL VIDRIOS
                    </td>
                    <td className="text-right font-mono py-2">
                      {interiores
                        .reduce(
                          (s, i) => s + (i.ancho / 1000) * (i.alto / 1000),
                          0,
                        )
                        .toFixed(4)}{" "}
                      m²
                    </td>
                    <td />
                    <td className="text-right font-mono py-2">
                      {formatPesos(costo_interiores)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        </Tab>

        {/* ── ACCESORIOS (pestaña 3) ── */}
        <Tab
          key="accesorios"
          title={
            <span className="flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5" /> Accesorios
              {accesorios.length > 0 && (
                <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-1.5 py-0.5 rounded-full font-medium leading-none">
                  {accesorios.length}
                </span>
              )}
            </span>
          }
        >
          <AccesoriosTab
            accesorios={accesorios}
            costo_accesorios={costo_accesorios}
          />
        </Tab>

        {/* ── RESUMEN OPTIMIZADO (pestaña 4) ── */}
        <Tab
          key="resumen"
          title={
            <span className="flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5" /> Resumen Optimizado
            </span>
          }
        >
          <div className="pt-4 overflow-x-auto">
            {resumenes.length === 0 ? (
              <div className="text-center py-8 text-stone-400">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Sin datos de optimización</p>
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-stone-700">
                    <Th>Perfil</Th>
                    <Th right>Cortes</Th>
                    <Th right>Total (m)</Th>
                    <Th right>Tiras</Th>
                    <Th right>Efic.</Th>
                    <Th right>Desperdicio</Th>
                    <Th right>Peso (kg)</Th>
                    <Th right>Costo fab.</Th>
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
                        {((r.total_mm || 0) / 1000).toFixed(2)} m
                      </Td>
                      <Td right mono>
                        {r.tiras}
                      </Td>
                      <Td right>
                        <EficienciaChip v={r.eficiencia} />
                      </Td>
                      <Td right mono>
                        {((r.desperdicio_mm || 0) / 1000).toFixed(2)} m
                      </Td>
                      <Td right mono>
                        {(r.kg || 0).toFixed(3)}
                      </Td>
                      <Td right mono bold>
                        {formatPesos(r.precio_total || 0)}
                      </Td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-stone-300 dark:border-stone-600 font-semibold">
                    <td className="py-2 text-xs text-stone-500">TOTALES</td>
                    <td className="text-right font-mono text-xs py-2">
                      {resumenes.reduce((s, r) => s + r.total_cortes, 0)}
                    </td>
                    <td className="text-right font-mono text-xs py-2">
                      {(
                        resumenes.reduce((s, r) => s + (r.total_mm || 0), 0) /
                        1000
                      ).toFixed(2)}{" "}
                      m
                    </td>
                    <td className="text-right font-mono text-xs py-2">
                      {totalTiras}
                    </td>
                    <td />
                    <td className="text-right font-mono text-xs py-2">
                      {(
                        resumenes.reduce(
                          (s, r) => s + (r.desperdicio_mm || 0),
                          0,
                        ) / 1000
                      ).toFixed(2)}{" "}
                      m
                    </td>
                    <td className="text-right font-mono text-xs py-2">
                      {totalKg.toFixed(3)}
                    </td>
                    <td className="text-right font-semibold text-sm py-2">
                      {formatPesos(costo_perfiles)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        </Tab>

        {/* ── MO TALLER (pestaña 4) ── */}
        <Tab
          key="mo"
          title={
            <span className="flex items-center gap-1.5">
              <HardHat className="w-3.5 h-3.5" /> M.O. Taller
            </span>
          }
        >
          <div className="pt-4 space-y-3">
            <div className="overflow-x-auto rounded-lg border border-stone-200 dark:border-stone-700">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-stone-100 dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700">
                    <Th>Elemento</Th>
                    <Th right>Cantidad</Th>
                    <Th right>Horas/u</Th>
                    <Th right>Total horas</Th>
                    <Th right>$/hora</Th>
                    <Th right>Costo</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {[
                    { label: "Marco", cant: cantMarcos, horas: horasMarco },
                    { label: "Hoja", cant: cantHojas, horas: horasHoja },
                    {
                      label: "Interior / Vidrio",
                      cant: cantInt,
                      horas: horasInt,
                    },
                    { label: "Cruces", cant: cantCruces, horas: horasCruce },
                    { label: "Contravidrios", cant: cantCV, horas: horasCV },
                  ]
                    .filter((row) => row.cant > 0 || row.horas > 0)
                    .map((row) => {
                      const totalH = row.cant * row.horas * multiplicador;
                      const costo = totalH * costoHoraTaller;
                      return (
                        <tr
                          key={row.label}
                          className="hover:bg-stone-50 dark:hover:bg-stone-800/30"
                        >
                          <td className="py-2 pl-3 text-stone-700 dark:text-stone-300">
                            {row.label}
                          </td>
                          <Td right mono>
                            {row.cant}
                          </Td>
                          <Td right mono>
                            {row.horas.toFixed(3)}
                          </Td>
                          <Td right mono>
                            {totalH.toFixed(3)}
                          </Td>
                          <Td right mono>
                            {formatPesos(costoHoraTaller)}
                          </Td>
                          <Td right mono bold>
                            {formatPesos(costo)}
                          </Td>
                        </tr>
                      );
                    })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-stone-300 dark:border-stone-600 font-semibold">
                    <td className="py-2 pl-3 text-stone-500">TOTAL</td>
                    <td />
                    <td />
                    <td className="text-right font-mono text-xs py-2">
                      {(moTallerCalculado / (costoHoraTaller || 1)).toFixed(3)}{" "}
                      h
                    </td>
                    <td />
                    <td className="text-right font-mono font-bold text-sm py-2">
                      {formatPesos(moTallerCalculado)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            {costoHoraTaller === 0 && (
              <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 rounded-lg px-3 py-2">
                <Wrench className="w-3.5 h-3.5 flex-shrink-0" />
                Costo/hora de taller en $0 — Configurar en Opciones → Mano de
                Obra
              </div>
            )}
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}

// ─── Tab de Accesorios ───────────────────────────────────────────────────────

function AccesoriosTab({
  accesorios,
  costo_accesorios,
}: {
  accesorios: ItemAccesorio[];
  costo_accesorios: number;
}) {
  // Mostrar la columna "Conjunto" solo si al menos un ítem tiene nombre_conjunto
  const hayConjuntos = accesorios.some((a) => a.nombre_conjunto);
  // Ítems que no van al presupuesto del cliente (solo uso de fabricación)
  const haySoloFab = accesorios.some((a) => !a.aparece_presupuesto);

  const totalUnidades = accesorios.reduce((s, a) => s + a.cantidad, 0);

  return (
    <div className="pt-4 space-y-3">
      {accesorios.length === 0 ? (
        <div className="text-center py-8 text-stone-400">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">Sin accesorios calculados</p>
          <p className="text-xs mt-1 opacity-60">
            Configurar reglas en Despiece → Accesorios
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-stone-200 dark:border-stone-700">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-stone-100 dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700">
                  <Th>Ubicación</Th>
                  <Th>Cod. Parte</Th>
                  <Th>Descripción</Th>
                  {hayConjuntos && <Th>Conjunto</Th>}
                  <Th right>Cant.</Th>
                  <Th right>P. Unit.</Th>
                  <Th right>Costo</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {accesorios.map((a, idx) => (
                  <tr
                    key={idx}
                    className={`hover:bg-stone-50 dark:hover:bg-stone-800/30 ${
                      !a.aparece_presupuesto ? "opacity-55" : ""
                    }`}
                  >
                    <td className="py-1.5 pl-3 pr-2">{nivelChip(a.nivel)}</td>
                    <td className="py-1.5 pr-3 font-mono font-semibold text-stone-700 dark:text-stone-300">
                      {a.cod_parte}
                    </td>
                    <td className="py-1.5 pr-3 text-stone-500">
                      <div className="flex items-center gap-1.5">
                        <span>{a.descripcion}</span>
                        {!a.aparece_presupuesto && (
                          <span className="text-[9px] bg-stone-200 text-stone-400 dark:bg-stone-700 dark:text-stone-500 px-1 py-0.5 rounded leading-none">
                            solo fab.
                          </span>
                        )}
                      </div>
                    </td>
                    {hayConjuntos && (
                      <td className="py-1.5 pr-3 text-stone-400 text-[10px] italic">
                        {a.nombre_conjunto ?? "—"}
                      </td>
                    )}
                    <Td right mono>
                      {a.cantidad}
                    </Td>
                    <Td right mono>
                      {a.precio_unitario > 0
                        ? formatPesos(a.precio_unitario)
                        : "—"}
                    </Td>
                    <Td right mono bold>
                      {a.precio_total > 0 ? formatPesos(a.precio_total) : "—"}
                    </Td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-stone-300 dark:border-stone-600 font-semibold text-xs">
                  <td
                    colSpan={hayConjuntos ? 4 : 3}
                    className="py-2 pl-3 text-stone-500"
                  >
                    TOTAL ACCESORIOS
                  </td>
                  <td className="text-right font-mono py-2 pr-3">
                    {totalUnidades} u
                  </td>
                  <td />
                  <td className="text-right font-mono font-bold text-sm py-2 pr-3">
                    {formatPesos(costo_accesorios)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Nota "solo fab." */}
          {haySoloFab && (
            <p className="text-[10px] text-stone-400 italic pl-1">
              Los ítems marcados como{" "}
              <span className="bg-stone-200 dark:bg-stone-700 text-stone-500 dark:text-stone-400 px-1 py-0.5 rounded not-italic">
                solo fab.
              </span>{" "}
              se usan en fabricación pero no aparecen en el presupuesto al
              cliente.
            </p>
          )}
        </>
      )}
    </div>
  );
}

// ─── Gráfico de Dona SVG (sin librería externa) ──────────────────────────────

function DonaChart({ filas }: { filas: (FilaPrecios & { pct: number })[] }) {
  const activas = filas.filter((f) => f.pct > 0);
  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const R = 60;
  const r = 35;

  // Calcular arcos
  let cumPct = 0;
  const arcos = activas.map((f) => {
    const start = cumPct;
    cumPct += f.pct;
    return { ...f, start, end: cumPct };
  });

  function polarToXY(pct: number, radius: number) {
    const angle = (pct / 100) * 2 * Math.PI - Math.PI / 2;
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  }

  function describeArc(start: number, end: number) {
    const s = polarToXY(start, R);
    const e = polarToXY(end, R);
    const si = polarToXY(start, r);
    const ei = polarToXY(end, r);
    const largeArc = end - start > 50 ? 1 : 0;
    return [
      `M ${s.x} ${s.y}`,
      `A ${R} ${R} 0 ${largeArc} 1 ${e.x} ${e.y}`,
      `L ${ei.x} ${ei.y}`,
      `A ${r} ${r} 0 ${largeArc} 0 ${si.x} ${si.y}`,
      "Z",
    ].join(" ");
  }

  if (activas.length === 0) {
    return (
      <div
        className="w-40 h-40 rounded-full border-[20px] border-stone-200 dark:border-stone-700"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {arcos.map((arco) => (
        <path
          key={arco.label}
          d={describeArc(arco.start, arco.end)}
          fill={arco.color}
          stroke="white"
          strokeWidth={1.5}
        >
          <title>
            {arco.label}: {arco.pct.toFixed(1)}%
          </title>
        </path>
      ))}
      {/* Texto central */}
      <text
        x={cx}
        y={cy - 6}
        textAnchor="middle"
        className="fill-stone-600 dark:fill-stone-300"
        fontSize={9}
      >
        Total
      </text>
      <text
        x={cx}
        y={cy + 8}
        textAnchor="middle"
        className="fill-stone-800 dark:fill-stone-100"
        fontSize={9}
        fontWeight="bold"
      >
        fab.
      </text>
    </svg>
  );
}

// ─── Sub-componentes internos ─────────────────────────────────────────────────

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

function IntTipoChip({ tipo }: { tipo: string }) {
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
      className={`pb-2 pt-2 px-3 text-[10px] font-semibold text-stone-400 uppercase tracking-wide whitespace-nowrap ${
        right ? "text-right" : "text-left"
      }`}
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
      className={`py-1.5 px-3 whitespace-nowrap ${right ? "text-right" : ""} ${
        mono ? "font-mono" : ""
      } ${bold ? "font-semibold" : ""}`}
    >
      {children}
    </td>
  );
}
