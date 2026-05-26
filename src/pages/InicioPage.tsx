import { useState, useEffect } from "react";
import { Card, CardBody, Button, Avatar } from "@heroui/react";
import {
  FolderOpen,
  Package,
  Wrench,
  Palette,
  TrendingUp,
  ArrowUpRight,
  Calendar,
  Compass,
  Sliders,
  MapPin,
  Phone,
  AlertCircle,
} from "lucide-react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";

// Hooks y tipos personalizados
import { usePerfiles } from "@/hooks/catalogo/usePerfiles";
import { useAccesorios } from "@/hooks/catalogo/useAccesorios";
import { useTratamientos } from "@/hooks/catalogo/useTratamientos";
import { useOpciones } from "@/hooks/catalogo/useOpciones";
import { useLineas } from "@/hooks/catalogo/useLineas";
import type { Obra } from "@/types";

// ── 1. IMPORTACIÓN DEL NUEVO ESQUELETO MÓDULAR ────────────────────────────────
import InicioPageSkeleton from "@/components/ui/skeletons/InicioPageSkeleton";

// ── CONSTANTES DE CONFIGURACIÓN DE PRODUCCIÓN ──────────────────────────────
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
];

const LINEA_COLORS = ["#db924b", "#3b82f6", "#10b981", "#6366f1", "#8b5e3c"];

export default function InicioPage() {
  // ── ACCESO A DATOS ASÍNCRONOS (HOOKS) ────────────────────────────────────
  const { data: perfiles = [], isLoading: loadingPerfiles } = usePerfiles();
  const { data: accesorios = [], isLoading: loadingAccesorios } =
    useAccesorios();
  const { data: tratamientos = [], isLoading: loadingTratamientos } =
    useTratamientos();
  const { data: opciones = [], isLoading: loadingOpciones } = useOpciones();
  const { data: lineas = [], isLoading: loadingLineas } = useLineas();

  // ── 2. UNIFICACIÓN DE ESTADOS DE CARGA ASÍNCRONOS ────────────────────────
  const isLoadingGlobal =
    loadingPerfiles ||
    loadingAccesorios ||
    loadingTratamientos ||
    loadingOpciones ||
    loadingLineas;

  const nombre = opciones[0]?.nombre ?? "Usuario";

  // Mapear distribución real agregada de perfiles por línea
  const dataLineas = lineas
    .map((l) => ({
      name: l.linea,
      value: perfiles.filter((p) => p.id_linea === l.id).length,
    }))
    .filter((l) => l.value > 0);

  // ── ARQUITECTURA SENSORIAL DE MODO OSCURO PARA ECHARTS ───────────────────
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setIsDarkMode(isDark);
    };

    checkTheme();

    // Mutex observador para escuchar si el atributo 'class' del HTML cambia globalmente
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // ── PALETAS REACTIVAS AL TEMA DE LA INTERFAZ ─────────────────────────────
  const themeColors = {
    text: isDarkMode ? "#e4e4e7" : "#3f3f46",
    grid: isDarkMode ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.04)",
    tooltipBg: isDarkMode ? "#18181b" : "#ffffff",
    tooltipBorder: isDarkMode ? "#3f3f46" : "#e4e4e7",
  };

  // ── CONFIGURACIONES DE GRÁFICOS (OPTIONS) ────────────────────────────────
  const areaOptions: echarts.EChartsOption = {
    tooltip: {
      trigger: "axis",
      backgroundColor: themeColors.tooltipBg,
      borderColor: themeColors.tooltipBorder,
      borderWidth: 1,
      textStyle: { color: themeColors.text, fontSize: 12 },
      formatter: (params: any) => {
        const item = params[0];
        return `<div class="font-sans">
                  <span class="text-zinc-400 block text-[10px] uppercase font-bold">${item.axisValue}</span>
                  <span class="font-mono font-bold text-amber-500 text-sm">$${item.value.toLocaleString()}</span>
                </div>`;
      },
    },
    grid: {
      top: "8%",
      left: "1%",
      right: "1%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: dataVentas.map((d) => d.name),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: themeColors.text,
        fontSize: 11,
        fontFamily: "sans-serif",
      },
    },
    yAxis: {
      type: "value",
      splitLine: { lineStyle: { color: themeColors.grid, type: "dashed" } },
      axisLabel: {
        color: themeColors.text,
        fontSize: 11,
        fontFamily: "monospace",
      },
    },
    series: [
      {
        data: dataVentas.map((d) => d.total),
        type: "line",
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "#db924b45" },
            { offset: 1, color: "#db924b00" },
          ]),
        },
        lineStyle: { color: "#db924b", width: 3 },
        itemStyle: { color: "#db924b" },
        showSymbol: false,
        triggerLineEvent: true,
        smooth: 0.35,
      },
    ],
  };

  const pieOptions: echarts.EChartsOption = {
    tooltip: {
      trigger: "item",
      backgroundColor: themeColors.tooltipBg,
      borderColor: themeColors.tooltipBorder,
      borderWidth: 1,
      textStyle: { color: themeColors.text },
    },
    series: [
      {
        type: "pie",
        radius: ["62%", "82%"],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 6 },
        data: dataLineas.map((l, i) => ({
          value: l.value,
          name: l.name,
          itemStyle: { color: LINEA_COLORS[i % LINEA_COLORS.length] },
        })),
        label: { show: false },
        emphasis: {
          label: {
            show: true,
            fontSize: 12,
            fontWeight: "bold",
            formatter: "{b}\n{c} u.",
            color: themeColors.text,
          },
        },
      },
    ],
  };

  const stats = [
    {
      label: "Obras activas",
      value: obras.length,
      icon: FolderOpen,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-950/30",
      trend: "+2 este mes",
      trendColor: "text-blue-500",
    },
    {
      label: "Perfiles",
      value: perfiles.length,
      icon: Package,
      color: "text-orange-500",
      bg: "bg-orange-50 dark:bg-orange-950/30",
      trend: "Catálogo General",
      trendColor: "text-zinc-400",
    },
    {
      label: "Accesorios",
      value: accesorios.length,
      icon: Wrench,
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-950/30",
      trend: "Stock activo",
      trendColor: "text-zinc-400",
    },
    {
      label: "Tratamientos",
      value: tratamientos.length,
      icon: Palette,
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
      trend: "Operativo",
      trendColor: "text-emerald-500",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 px-4 md:px-0 animate-in fade-in duration-300">
      {/* ── SECCIÓN A: CABECERA DINÁMICA (SIEMPRE REAL Y VISIBLE) ────────────── */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900/50 p-5 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/50">
        <div>
          <h2 className="text-3xl font-extrabold text-zinc-800 dark:text-zinc-100 tracking-tight">
            {isLoadingGlobal ? (
              <span className="inline-block w-44 h-7 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse mt-1" />
            ) : (
              `Buen día, ${nombre}`
            )}
          </h2>
          <p className="text-zinc-400 text-xs mt-1 flex items-center gap-1.5 font-medium capitalize">
            <Calendar className="w-3.5 h-3.5" />
            {new Date().toLocaleDateString("es-AR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
      </header>

      {/* ── 3. INTERRUPTOR CONDICIONAL DE CONTENIDO ABAJO DEL HEADER ────────── */}
      {isLoadingGlobal ? (
        <InicioPageSkeleton />
      ) : (
        <>
          {/* ── SECCIÓN B: GRID DE MÉTRICAS (KPI CARDS) ────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map(
              ({ label, value, icon: Icon, color, bg, trend, trendColor }) => (
                <Card
                  key={label}
                  isHoverable
                  className="border border-zinc-200/60 dark:border-zinc-800/60 shadow-none bg-white dark:bg-zinc-900/50"
                >
                  <CardBody className="p-4 flex flex-row items-center justify-between gap-2">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 dark:text-zinc-500">
                        {label}
                      </p>
                      <p className="text-3xl font-mono font-bold text-zinc-900 dark:text-zinc-50">
                        {value}
                      </p>
                      <span
                        className={`text-[11px] font-medium block ${trendColor}`}
                      >
                        {trend}
                      </span>
                    </div>
                    <div className={`p-3 rounded-xl ${bg} ${color} shrink-0`}>
                      <Icon size={20} strokeWidth={2.5} />
                    </div>
                  </CardBody>
                </Card>
              ),
            )}
          </div>

          {/* ── SECCIÓN C: LAYOUT PRINCIPAL DEL DASHBOARD ──────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* PANEL IZQUIERDO Y CENTRAL */}
            <div className="lg:col-span-2 space-y-6">
              {/* Gráfico Analítico de Área */}
              <Card className="border border-zinc-200/60 dark:border-zinc-800/60 shadow-none bg-white dark:bg-zinc-900/50">
                <CardBody className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-sm font-bold flex items-center gap-2 text-zinc-800 dark:text-zinc-100">
                        <TrendingUp className="text-emerald-500 w-4 h-4" />{" "}
                        Rendimiento de Proyectos
                      </h4>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Volumen financiero mensual estimado de cotizaciones
                      </p>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                      +12.5%
                    </span>
                  </div>
                  <div className="h-[220px] w-full">
                    <ReactECharts
                      option={areaOptions}
                      style={{ height: "100%", width: "100%" }}
                      notMerge={true}
                      lazyUpdate={true}
                    />
                  </div>
                </CardBody>
              </Card>

              {/* Gestión de Proyectos / Últimas Obras */}
              <Card className="bg-white dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60 shadow-none">
                <CardBody className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">
                        Últimas Obras / Proyectos
                      </h4>
                      <p className="text-xs text-zinc-400">
                        Estado de monitoreo de carpinterías en ejecución
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="light"
                      className="text-xs text-zinc-500 dark:text-zinc-400"
                      endContent={<ArrowUpRight className="w-3.5 h-3.5" />}
                    >
                      Ver todas
                    </Button>
                  </div>

                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                    {obras.slice(0, 3).map((obra) => (
                      <div
                        key={obra.id}
                        className="flex items-center justify-between py-3 first:pt-0 last:pb-0 group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar
                            size="sm"
                            name={`${obra.nombre[0]}${obra.apellido[0]}`}
                            classNames={{
                              base: "bg-zinc-100 dark:bg-zinc-800 font-bold text-zinc-700 dark:text-zinc-300 text-xs shrink-0",
                            }}
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-amber-500 transition-colors">
                              {obra.apellido}, {obra.nombre}
                            </p>
                            <p className="text-[11px] text-zinc-400 truncate flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-zinc-400" />{" "}
                              {obra.direccion} • {obra.ciudad}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          <span className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-zinc-400 bg-zinc-50 dark:bg-zinc-950 px-2 py-1 rounded-md">
                            <Phone className="w-2.5 h-2.5" /> {obra.telefono}
                          </span>
                          <Button
                            size="sm"
                            variant="flat"
                            isIconOnly
                            className="rounded-lg h-7 w-7 text-zinc-400 bg-zinc-50 dark:bg-zinc-950"
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* PANEL LATERAL DERECHO */}
            <div className="space-y-6">
              {/* Distribución / Mix de Producción */}
              <Card className="border border-zinc-200/60 dark:border-zinc-800/60 shadow-none bg-white dark:bg-zinc-900/50">
                <CardBody className="p-5">
                  <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">
                    Mix de Producción
                  </h4>
                  <p className="text-xs text-zinc-400 mb-4">
                    Perfiles de aluminio consolidados por línea estructural
                  </p>

                  {dataLineas.length > 0 ? (
                    <>
                      <div className="h-[160px] w-full flex justify-center">
                        <ReactECharts
                          option={pieOptions}
                          style={{ height: "100%", width: "100%" }}
                          notMerge={true}
                          lazyUpdate={true}
                        />
                      </div>
                      <div className="space-y-1.5 mt-4 max-h-[160px] overflow-y-auto pr-1 scrollbar-thin">
                        {dataLineas.map((item, index) => (
                          <div
                            key={item.name}
                            className="flex items-center justify-between text-xs p-1.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-950/40 transition-colors"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{
                                  backgroundColor:
                                    LINEA_COLORS[index % LINEA_COLORS.length],
                                }}
                              />
                              <span className="text-zinc-600 dark:text-zinc-300 truncate font-medium">
                                {item.name}
                              </span>
                            </div>
                            <span className="font-bold font-mono text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-[10px]">
                              {item.value} u.
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-52 text-xs text-zinc-400 italic gap-2 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                      <AlertCircle className="w-6 h-6 text-zinc-300 stroke-1" />
                      Métricas de catálogo no detectadas
                    </div>
                  )}
                </CardBody>
              </Card>

              {/* Accesos de Control de Configuración */}
              <Card className="bg-gradient-to-b from-white to-zinc-50 dark:from-zinc-900/50 dark:to-zinc-900/10 border border-zinc-200/60 dark:border-zinc-800/60 shadow-none">
                <CardBody className="p-5 space-y-3">
                  <div>
                    <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">
                      Accesos Rápidos
                    </h4>
                    <p className="text-xs text-zinc-400">
                      Herramientas maestras del sistema
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="flat"
                      className="justify-start font-semibold text-xs bg-zinc-100/70 hover:bg-zinc-200/60 dark:bg-zinc-800/40 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300"
                      startContent={
                        <Compass className="w-4 h-4 text-zinc-400" />
                      }
                    >
                      Explorador de Catálogo
                    </Button>
                    <Button
                      size="sm"
                      variant="flat"
                      className="justify-start font-semibold text-xs bg-zinc-100/70 hover:bg-zinc-200/60 dark:bg-zinc-800/40 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300"
                      startContent={
                        <Sliders className="w-4 h-4 text-zinc-400" />
                      }
                    >
                      Configurar Tratamientos
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
