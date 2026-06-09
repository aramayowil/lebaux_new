import { useState, useEffect } from "react";
import { Button, Avatar } from "@heroui/react";
import {
  FolderOpen,
  Package,
  Wrench,
  Palette,
  ArrowUpRight,
  Calendar,
  Compass,
  Sliders,
  MapPin,
  AlertCircle,
  ChevronRight,
  Activity,
  Zap,
  CheckCircle2,
  ArrowUp,
  BarChart3,
} from "lucide-react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";
import clsx from "clsx";

import { usePerfiles } from "@/hooks/catalogo/usePerfiles";
import { useAccesorios } from "@/hooks/catalogo/useAccesorios";
import { useTratamientos } from "@/hooks/catalogo/useTratamientos";
import { useOpciones } from "@/hooks/catalogo/useOpciones";
import { useLineas } from "@/hooks/catalogo/useLineas";
import type { Obra } from "@/types";

import InicioPageSkeleton from "@/components/ui/skeletons/InicioPageSkeleton";

// ── DATA MOCK ────────────────────────────────────────────────────────────────
const obras: Obra[] = [
  {
    id: 1,
    apellido: "Aramayo",
    nombre: "David",
    direccion: "Av. Siempre Viva 745",
    telefono: "3584538695",
    ciudad: "Córdoba",
  },
  {
    id: 2,
    apellido: "Perez",
    nombre: "Juan",
    direccion: "Av. Las Heras 1550",
    telefono: "3584538695",
    ciudad: "Córdoba",
  },
  {
    id: 3,
    apellido: "Lopez",
    nombre: "Maria",
    direccion: "Av. Mitre 745",
    telefono: "3584525695",
    ciudad: "Villa Maria",
  },
  {
    id: 4,
    apellido: "Gomez",
    nombre: "Ana",
    direccion: "Av. Siempre Viva 745",
    telefono: "3584224533",
    ciudad: "Rio Tercero",
  },
];

const dataVentas = [
  { name: "Ene", total: 2400 },
  { name: "Feb", total: 3600 },
  { name: "Mar", total: 4800 },
  { name: "Abr", total: 4500 },
  { name: "May", total: 5800 },
  { name: "Jun", total: 6200 },
];

const LINEA_COLORS = ["#db924b", "#3b82f6", "#10b981", "#6366f1", "#8b5e3c"];

const OBRA_STATUSES = [
  {
    label: "En curso",
    className:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
  },
  {
    label: "Pendiente",
    className:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
  },
  {
    label: "En revisión",
    className:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
  },
  {
    label: "En curso",
    className:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
  },
];

const ACTIVITY_FEED = [
  {
    icon: FolderOpen,
    iconCls: "text-blue-500",
    bgCls: "bg-blue-500/10",
    title: "Nueva obra registrada",
    desc: "Aramayo, David · Córdoba",
    time: "Hace 2 hs",
  },
  {
    icon: Package,
    iconCls: "text-lebaux-amber",
    bgCls: "bg-amber-500/10",
    title: "Catálogo actualizado",
    desc: "32 perfiles modificados",
    time: "Ayer",
  },
  {
    icon: CheckCircle2,
    iconCls: "text-emerald-500",
    bgCls: "bg-emerald-500/10",
    title: "Obra completada",
    desc: "Perez, Juan · Córdoba",
    time: "Hace 3 días",
  },
  {
    icon: Palette,
    iconCls: "text-violet-500",
    bgCls: "bg-violet-500/10",
    title: "Nuevo tratamiento",
    desc: "Anodizado champagne",
    time: "Hace 5 días",
  },
];

// ── SPARKLINE COMPONENT ──────────────────────────────────────────────────────
function Sparkline({
  data,
  color = "#db924b",
}: {
  data: number[];
  color?: string;
}) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const W = 72,
    H = 28;
  const pts = data.map((v, i): [number, number] => [
    (i / (data.length - 1)) * W,
    H - ((v - min) / range) * (H - 4) - 2,
  ]);
  const pathD = pts
    .map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x},${y}`)
    .join(" ");
  const areaD = `M 0,${H} L ${pts.map(([x, y]) => `${x},${y}`).join(" L ")} L ${W},${H} Z`;
  const gradId = `sg-${color.replace("#", "")}`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-full"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${gradId})`} />
      <path
        d={pathD}
        stroke={color}
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── GREETING HELPER ──────────────────────────────────────────────────────────
function getGreeting(nombre: string): string {
  const h = new Date().getHours();
  if (h < 12) return `Buenos días, ${nombre}`;
  if (h < 19) return `Buenas tardes, ${nombre}`;
  return `Buenas noches, ${nombre}`;
}

// ── CARD SHELL ───────────────────────────────────────────────────────────────
function Panel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "bg-white dark:bg-zinc-900/80 border border-zinc-200/70 dark:border-zinc-800/70 rounded-2xl overflow-hidden",
        className,
      )}
    >
      {children}
    </div>
  );
}

function PanelHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-zinc-100 dark:border-zinc-800">
      <div>
        <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">
          {title}
        </h4>
        {subtitle && (
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function InicioPage() {
  const { data: perfiles = [], isLoading: loadingPerfiles } = usePerfiles();
  const { data: accesorios = [], isLoading: loadingAccesorios } =
    useAccesorios();
  const { data: tratamientos = [], isLoading: loadingTratamientos } =
    useTratamientos();
  const { data: opciones, isLoading: loadingOpciones } = useOpciones();
  const { data: lineas = [], isLoading: loadingLineas } = useLineas();

  const isLoadingGlobal =
    loadingPerfiles ||
    loadingAccesorios ||
    loadingTratamientos ||
    loadingOpciones ||
    loadingLineas;

  const nombre = opciones?.nombre ?? "Usuario";

  const dataLineas = lineas
    .map((l) => ({
      name: l.linea,
      value: perfiles.filter((p) => p.id_linea === l.id).length,
    }))
    .filter((l) => l.value > 0);

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [chartPeriod, setChartPeriod] = useState<"3M" | "6M" | "1A">("6M");

  useEffect(() => {
    const check = () =>
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => obs.disconnect();
  }, []);

  // ── THEME PALETTE ──────────────────────────────────────────────────────────
  const tc = {
    text: isDarkMode ? "#e4e4e7" : "#3f3f46",
    muted: isDarkMode ? "#71717a" : "#a1a1aa",
    grid: isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
    bg: isDarkMode ? "#18181b" : "#ffffff",
    border: isDarkMode ? "#3f3f46" : "#e4e4e7",
  };

  // ── ECHARTS: AREA ──────────────────────────────────────────────────────────
  const areaOptions: echarts.EChartsOption = {
    tooltip: {
      trigger: "axis",
      backgroundColor: tc.bg,
      borderColor: tc.border,
      borderWidth: 1,
      textStyle: { color: tc.text, fontSize: 12 },
      formatter: (params: any) => {
        const item = params[0];
        return `<div style="font-family:sans-serif;padding:2px 0">
          <span style="color:${tc.muted};font-size:10px;text-transform:uppercase;font-weight:700;letter-spacing:.06em">${item.axisValue}</span><br/>
          <span style="color:#db924b;font-family:monospace;font-weight:800;font-size:15px">$${item.value.toLocaleString()}</span>
        </div>`;
      },
    },
    grid: {
      top: "10%",
      left: "0%",
      right: "0%",
      bottom: "0%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: dataVentas.map((d) => d.name),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: tc.muted, fontSize: 11, fontFamily: "sans-serif" },
    },
    yAxis: {
      type: "value",
      splitLine: { lineStyle: { color: tc.grid, type: "dashed" } },
      axisLabel: {
        color: tc.muted,
        fontSize: 10,
        fontFamily: "monospace",
        formatter: (v: number) => `$${(v / 1000).toFixed(0)}k`,
      },
    },
    series: [
      {
        data: dataVentas.map((d) => d.total),
        type: "line",
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(219,146,75,0.20)" },
            { offset: 1, color: "rgba(219,146,75,0)" },
          ]),
        },
        lineStyle: { color: "#db924b", width: 2.5 },
        itemStyle: {
          color: "#db924b",
          borderWidth: 3,
          borderColor: isDarkMode ? "#18181b" : "#fff",
        },
        symbol: "circle",
        symbolSize: 7,
        showSymbol: false,
        emphasis: { scale: true },
        smooth: 0.4,
      },
    ],
  };

  // ── ECHARTS: DONUT ─────────────────────────────────────────────────────────
  const pieOptions: echarts.EChartsOption = {
    tooltip: {
      trigger: "item",
      backgroundColor: tc.bg,
      borderColor: tc.border,
      borderWidth: 1,
      textStyle: { color: tc.text, fontSize: 12 },
    },
    graphic: [
      {
        type: "text",
        left: "center",
        top: "40%",
        style: {
          text: String(perfiles.length),
          fill: tc.text,
          fontSize: 18,
          fontWeight: "bold",
          fontFamily: "monospace",
        },
      },
      {
        type: "text",
        left: "center",
        top: "56%",
        style: {
          text: "perfiles",
          fill: tc.muted,
          fontSize: 10,
          fontFamily: "sans-serif",
        },
      },
    ],
    series: [
      {
        type: "pie",
        radius: ["58%", "78%"],
        center: ["50%", "50%"],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 5,
          borderColor: "transparent",
          borderWidth: 2,
        },
        data: dataLineas.map((l, i) => ({
          value: l.value,
          name: l.name ?? "Desconocido",
          itemStyle: { color: LINEA_COLORS[i % LINEA_COLORS.length] },
        })),
        label: { show: false },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0,0,0,0.25)",
          },
          label: {
            show: true,
            fontSize: 11,
            fontWeight: "bold",
            formatter: "{b}\n{c} u.",
            color: tc.text,
          },
        },
      },
    ],
  };

  // ── STATS DEFINITION ───────────────────────────────────────────────────────
  const stats = [
    {
      label: "Obras activas",
      value: obras.length,
      icon: FolderOpen,
      iconColor: "text-blue-500",
      accent: "#3b82f6",
      bg: "bg-blue-500/10",
      trend: "+2 este mes",
      trendUp: true,
      sparkData: [2, 3, 2, 4, 3, 4, obras.length],
      sparkColor: "#3b82f6",
    },
    {
      label: "Perfiles",
      value: perfiles.length,
      icon: Package,
      iconColor: "text-lebaux-amber",
      accent: "#db924b",
      bg: "bg-amber-500/10",
      trend: "Catálogo general",
      trendUp: null as boolean | null,
      sparkData: [120, 118, 125, 130, 128, 132, perfiles.length || 135],
      sparkColor: "#db924b",
    },
    {
      label: "Accesorios",
      value: accesorios.length,
      icon: Wrench,
      iconColor: "text-violet-500",
      accent: "#8b5cf6",
      bg: "bg-violet-500/10",
      trend: "Stock activo",
      trendUp: null as boolean | null,
      sparkData: [85, 88, 90, 87, 92, 94, accesorios.length || 95],
      sparkColor: "#8b5cf6",
    },
    {
      label: "Tratamientos",
      value: tratamientos.length,
      icon: Palette,
      iconColor: "text-emerald-500",
      accent: "#10b981",
      bg: "bg-emerald-500/10",
      trend: "Operativo",
      trendUp: true,
      sparkData: [10, 11, 12, 13, 14, 15, tratamientos.length || 16],
      sparkColor: "#10b981",
    },
  ];

  // ── CATALOG HEALTH BARS ────────────────────────────────────────────────────
  const catalogHealth = [
    { label: "Perfiles", value: perfiles.length, max: 200, color: "#db924b" },
    {
      label: "Accesorios",
      value: accesorios.length,
      max: 150,
      color: "#8b5cf6",
    },
    {
      label: "Tratamientos",
      value: tratamientos.length,
      max: 30,
      color: "#10b981",
    },
  ];

  // ── CHART SUMMARY STATS ────────────────────────────────────────────────────
  const chartSummary = [
    {
      label: "Promedio mensual",
      value: `$${(dataVentas.reduce((a, b) => a + b.total, 0) / dataVentas.length / 1000).toFixed(1)}k`,
      green: false,
    },
    {
      label: "Máximo alcanzado",
      value: `$${(Math.max(...dataVentas.map((d) => d.total)) / 1000).toFixed(1)}k`,
      green: false,
    },
    { label: "Crecimiento", value: "+12.5%", green: true },
  ];

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full">
      {/* ── HEADER ────────────────────────────────────────────────────────── */}
      <header className="shrink-0 px-6 pt-3 pb-3 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="flex items-center justify-between gap-4">
          <div>
            {isLoadingGlobal ? (
              <div className="w-56 h-7 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse" />
            ) : (
              <h2 className="text-2xl font-black text-zinc-800 dark:text-zinc-100 tracking-tight">
                {getGreeting(nombre)}
              </h2>
            )}
            <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-1.5 flex items-center gap-1.5 font-medium capitalize">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              {new Date().toLocaleDateString("es-AR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          {/* Mini KPI strip */}
          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/50 rounded-xl px-3 py-2">
              <Activity className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300 whitespace-nowrap">
                {obras.length} obras activas
              </span>
            </div>
            <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/50 rounded-xl px-3 py-2">
              <Zap className="w-3.5 h-3.5 text-lebaux-amber shrink-0" />
              <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300 whitespace-nowrap">
                {perfiles.length + accesorios.length} ítems de catálogo
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ── SCROLLABLE BODY ────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto bg-zinc-50 dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto p-5 space-y-5 pb-12 animate-in fade-in duration-300">
          {isLoadingGlobal ? (
            <InicioPageSkeleton />
          ) : (
            <>
              {/* ── KPI CARDS ROW ──────────────────────────────────────────── */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map(
                  ({
                    label,
                    value,
                    icon: Icon,
                    iconColor,
                    accent,
                    bg,
                    trend,
                    trendUp,
                    sparkData,
                    sparkColor,
                  }) => (
                    <div
                      key={label}
                      className="relative overflow-hidden bg-white dark:bg-zinc-900/80 border border-zinc-200/70 dark:border-zinc-800/70 rounded-2xl p-2 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 cursor-default"
                      style={{ borderLeft: `3px solid ${accent}` }}
                    >
                      {/* Background sparkline */}
                      <div className="absolute bottom-0 right-0 w-[80px] h-[36px] opacity-50 pointer-events-none">
                        <Sparkline data={sparkData} color={sparkColor} />
                      </div>

                      {/* Icon badge */}
                      <div
                        className={clsx("inline-flex p-2 rounded-xl mb-3", bg)}
                      >
                        <Icon
                          className={clsx("w-4 h-4", iconColor)}
                          strokeWidth={2}
                        />
                      </div>

                      {/* Value */}
                      <p className="text-[2rem] font-black font-mono text-zinc-900 dark:text-zinc-50 leading-none mb-1">
                        {value.toLocaleString()}
                      </p>

                      {/* Label */}
                      <p className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 dark:text-zinc-500 mb-2">
                        {label}
                      </p>

                      {/* Trend */}
                      <div className="flex items-center gap-1">
                        {trendUp !== null && (
                          <ArrowUp
                            className={clsx(
                              "w-3 h-3",
                              trendUp
                                ? "text-emerald-500"
                                : "text-red-400 rotate-180",
                            )}
                          />
                        )}
                        <span
                          className={clsx(
                            "text-[11px] font-semibold",
                            trendUp === true
                              ? "text-emerald-500"
                              : "text-zinc-400",
                          )}
                        >
                          {trend}
                        </span>
                      </div>
                    </div>
                  ),
                )}
              </div>

              {/* ── MAIN LAYOUT 2/3 + 1/3 ─────────────────────────────────── */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* LEFT COLUMN ─────────────────────────────────────────────── */}
                <div className="lg:col-span-2 space-y-5">
                  {/* Area Chart */}
                  <Panel>
                    <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <BarChart3 className="w-4 h-4 text-lebaux-amber" />
                          <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">
                            Rendimiento de Proyectos
                          </h4>
                          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                            +12.5%
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 ml-6">
                          Volumen financiero estimado de cotizaciones
                        </p>
                      </div>

                      {/* Period selector */}
                      <div className="flex items-center gap-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5 shrink-0">
                        {(["3M", "6M", "1A"] as const).map((p) => (
                          <button
                            key={p}
                            onClick={() => setChartPeriod(p)}
                            className={clsx(
                              "text-[11px] font-bold px-2.5 py-1 rounded-md transition-all",
                              chartPeriod === p
                                ? "bg-white dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100 shadow-sm"
                                : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300",
                            )}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="px-5 pt-4 pb-5">
                      <div className="h-[210px] w-full">
                        <ReactECharts
                          option={areaOptions}
                          style={{ height: "100%", width: "100%" }}
                          notMerge={true}
                          lazyUpdate={true}
                        />
                      </div>

                      {/* Summary row */}
                      <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                        {chartSummary.map(({ label, value, green }) => (
                          <div key={label} className="text-center">
                            <p className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 dark:text-zinc-500">
                              {label}
                            </p>
                            <p
                              className={clsx(
                                "text-sm font-black font-mono mt-0.5",
                                green
                                  ? "text-emerald-500"
                                  : "text-zinc-800 dark:text-zinc-100",
                              )}
                            >
                              {value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Panel>

                  {/* Recent Obras */}
                  <Panel>
                    <PanelHeader
                      title="Últimas Obras"
                      subtitle="Carpinterías activas en seguimiento"
                    >
                      <Button
                        size="sm"
                        variant="flat"
                        endContent={<ChevronRight className="w-3.5 h-3.5" />}
                        className="text-xs font-bold text-lebaux-amber bg-amber-500/10 hover:bg-amber-500/20 border-none h-8 rounded-xl"
                      >
                        Ver todas
                      </Button>
                    </PanelHeader>

                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                      {obras.slice(0, 4).map((obra, i) => {
                        const status = OBRA_STATUSES[i % OBRA_STATUSES.length];
                        return (
                          <div
                            key={obra.id}
                            className="flex items-center gap-3 px-5 py-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors group cursor-pointer"
                          >
                            <Avatar
                              size="sm"
                              name={`${obra.nombre?.[0] ?? ""}${obra.apellido?.[0] ?? ""}`}
                              classNames={{
                                base: "bg-zinc-100 dark:bg-zinc-800 font-bold text-zinc-600 dark:text-zinc-300 text-xs shrink-0 w-8 h-8",
                              }}
                            />

                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-lebaux-amber transition-colors">
                                {obra.apellido}, {obra.nombre}
                              </p>
                              <p className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5 truncate">
                                <MapPin className="w-3 h-3 shrink-0" />
                                {obra.direccion} · {obra.ciudad}
                              </p>
                            </div>

                            <span
                              className={clsx(
                                "hidden sm:block text-[10px] font-bold px-2.5 py-1 rounded-lg shrink-0",
                                status.className,
                              )}
                            >
                              {status.label}
                            </span>

                            <ArrowUpRight className="w-4 h-4 text-zinc-300 dark:text-zinc-700 group-hover:text-lebaux-amber transition-colors shrink-0" />
                          </div>
                        );
                      })}
                    </div>
                  </Panel>
                </div>

                {/* RIGHT COLUMN ────────────────────────────────────────────── */}
                <div className="space-y-5">
                  {/* Activity Feed */}
                  <Panel>
                    <PanelHeader
                      title="Actividad reciente"
                      subtitle="Eventos del sistema"
                    />
                    <div className="px-5 py-4 space-y-3.5">
                      {ACTIVITY_FEED.map((item, i) => {
                        const ItemIcon = item.icon;
                        return (
                          <div key={i} className="flex items-start gap-3">
                            <div
                              className={clsx(
                                "p-1.5 rounded-lg shrink-0 mt-0.5",
                                item.bgCls,
                              )}
                            >
                              <ItemIcon
                                className={clsx("w-3.5 h-3.5", item.iconCls)}
                                strokeWidth={2}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-zinc-700 dark:text-zinc-200 leading-tight">
                                {item.title}
                              </p>
                              <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                                {item.desc}
                              </p>
                            </div>
                            <span className="text-[10px] font-medium text-zinc-300 dark:text-zinc-600 whitespace-nowrap mt-0.5">
                              {item.time}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </Panel>

                  {/* Mix de Producción */}
                  <Panel>
                    <PanelHeader
                      title="Mix de Producción"
                      subtitle="Perfiles por línea estructural"
                    />
                    <div className="px-5 pb-5 pt-3">
                      {dataLineas.length > 0 ? (
                        <>
                          <div className="h-[148px] w-full">
                            <ReactECharts
                              option={pieOptions}
                              style={{ height: "100%", width: "100%" }}
                              notMerge={true}
                              lazyUpdate={true}
                            />
                          </div>
                          <div className="space-y-1.5 mt-3 max-h-[128px] overflow-y-auto scrollbar-thin pr-0.5">
                            {dataLineas.map((item, index) => (
                              <div
                                key={item.name}
                                className="flex items-center justify-between rounded-lg px-1.5 py-1 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <div
                                    className="w-2 h-2 rounded-full shrink-0"
                                    style={{
                                      backgroundColor:
                                        LINEA_COLORS[
                                          index % LINEA_COLORS.length
                                        ],
                                    }}
                                  />
                                  <span className="text-[12px] font-medium text-zinc-600 dark:text-zinc-300 truncate">
                                    {item.name}
                                  </span>
                                </div>
                                <span className="text-[10px] font-bold font-mono text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                                  {item.value} u.
                                </span>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-40 text-xs text-zinc-400 gap-2 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                          <AlertCircle className="w-5 h-5 text-zinc-300 stroke-1" />
                          <span className="italic">Sin datos de catálogo</span>
                        </div>
                      )}
                    </div>
                  </Panel>

                  {/* Catalog Health + Quick Actions */}
                  <Panel>
                    <PanelHeader
                      title="Estado del Catálogo"
                      subtitle="Completitud del sistema"
                    />

                    <div className="px-5 pt-4 pb-2 space-y-3.5">
                      {catalogHealth.map((item) => (
                        <div key={item.label}>
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                              {item.label}
                            </span>
                            <span className="text-[11px] font-mono font-bold text-zinc-400 dark:text-zinc-500">
                              {item.value}
                              <span className="text-zinc-300 dark:text-zinc-600">
                                {" "}
                                / {item.max}
                              </span>
                            </span>
                          </div>
                          <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{
                                width: `${Math.min((item.value / item.max) * 100, 100)}%`,
                                backgroundColor: item.color,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Quick actions */}
                    <div className="px-5 pb-5 pt-4 border-t border-zinc-100 dark:border-zinc-800 mt-4 space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">
                        Accesos rápidos
                      </p>
                      {[
                        {
                          icon: Compass,
                          label: "Explorador de Catálogo",
                        },
                        {
                          icon: Sliders,
                          label: "Configurar Tratamientos",
                        },
                      ].map(({ icon: QIcon, label }) => (
                        <button
                          key={label}
                          className="w-full flex items-center gap-2.5 text-xs font-semibold px-3 py-2.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/40 dark:hover:bg-zinc-800/70 text-zinc-600 dark:text-zinc-300 transition-colors text-left"
                        >
                          <QIcon className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
                          {label}
                          <ChevronRight className="w-3.5 h-3.5 ml-auto text-zinc-300 dark:text-zinc-600" />
                        </button>
                      ))}
                    </div>
                  </Panel>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
