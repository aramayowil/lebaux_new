import { Card, CardBody, Button, Chip, Progress } from "@heroui/react";
import {
  FolderOpen,
  Package,
  Wrench,
  Palette,
  TrendingUp,
  ArrowUpRight,
  Calendar,
} from "lucide-react";
import { useObrasStore } from "@/store/obrasStore";
import { useCatalogosStore } from "@/store/catalogosStore";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Datos simulados para la "vista del futuro"
const dataVentas = [
  { name: "Ene", total: 4000 },
  { name: "Feb", total: 3000 },
  { name: "Mar", total: 5000 },
  { name: "Abr", total: 4500 },
];

const dataLineas = [
  { name: "Módena", value: 400, color: "#db924b" },
  { name: "A30", value: 300, color: "#334e68" },
  { name: "Herrero", value: 300, color: "#627d98" },
];

export default function InicioPage() {
  const obras = useObrasStore((s) => s.obras);
  const perfiles = useCatalogosStore((s) => s.perfiles);
  const accesorios = useCatalogosStore((s) => s.accesorios);
  const tratamientos = useCatalogosStore((s) => s.tratamientos);
  const opciones = useCatalogosStore((s) => s.opciones);

  const stats = [
    {
      label: "Obras activas",
      value: obras.length,
      icon: FolderOpen,
      color: "text-blue-500",
    },
    {
      label: "Perfiles",
      value: perfiles.length,
      icon: Package,
      color: "text-steel-500",
    },
    {
      label: "Accesorios",
      value: accesorios.length,
      icon: Wrench,
      color: "text-amber-500",
    },
    {
      label: "Tratamientos",
      value: tratamientos.length,
      icon: Palette,
      color: "text-emerald-500",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Header con Badge de Estado */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Chip
              size="sm"
              variant="flat"
              color="warning"
              className="capitalize font-bold text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
            >
              Panel de Control v2.0
            </Chip>
          </div>
          <h2 className="font-display text-4xl font-bold text-steel-800 dark:text-steel-100 tracking-tight">
            Buen día, {opciones.nombre || "David"}
          </h2>
          <p className="text-steel-500 dark:text-steel-400 mt-1 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {new Date().toLocaleDateString("es-AR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
        <Button
          endContent={<ArrowUpRight className="w-4 h-4" />}
          className="bg-[#db924b] text-white font-bold shadow-lg shadow-amber-500/20"
        >
          Nuevo Presupuesto
        </Button>
      </header>

      {/* Stats Cards Re-diseñadas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card
            key={label}
            className="border-none bg-white dark:bg-steel-950 shadow-sm border border-steel-100 dark:border-steel-800/50"
          >
            <CardBody className="p-4 flex flex-row items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-steel-400">
                  {label}
                </p>
                <p className="text-3xl font-mono font-bold text-steel-900 dark:text-steel-50 mt-1">
                  {value}
                </p>
              </div>
              <div
                className={`p-3 rounded-2xl bg-steel-50 dark:bg-steel-900 ${color}`}
              >
                <Icon size={24} strokeWidth={2.5} />
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Sección de Gráficos (El "Futuro" del Sistema) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Ventas Principal */}
        <Card className="lg:col-span-2 bg-white dark:bg-steel-950 border-none shadow-sm overflow-hidden">
          <CardBody className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="text-steel-800 dark:text-steel-100 font-bold flex items-center gap-2">
                  <TrendingUp className="text-emerald-500 w-5 h-5" />{" "}
                  Rendimiento de Proyectos
                </h4>
                <p className="text-xs text-steel-500">
                  Volumen de cotizaciones mensuales
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-emerald-500">
                  +12.5%
                </span>
              </div>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dataVentas}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#db924b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#db924b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#88888820"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#888", fontSize: 12 }}
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                    itemStyle={{ color: "#db924b" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#db924b"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorTotal)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        {/* Distribución de Líneas de Aluminio */}
        <Card className="bg-white dark:bg-steel-950 border-none shadow-sm">
          <CardBody className="p-6">
            <h4 className="text-steel-800 dark:text-steel-100 font-bold mb-1">
              Mix de Producción
            </h4>
            <p className="text-xs text-steel-500 mb-4">Líneas más utilizadas</p>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dataLineas}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {dataLineas.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3 mt-4">
              {dataLineas.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs font-medium dark:text-steel-300">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-xs font-bold">{item.value / 10}%</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Últimos Presupuestos / Proyectos en curso */}
      <section className="space-y-4">
        <h3 className="font-display text-[11px] font-bold text-steel-400 uppercase tracking-widest">
          Estado de Proyectos Recientes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-white dark:bg-steel-950 border border-steel-100 dark:border-steel-800/50 shadow-none">
            <CardBody className="p-4 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm">
                  Residencial Yerba Buena
                </span>
                <Chip size="sm" color="success" variant="flat">
                  En Corte
                </Chip>
              </div>
              <Progress
                size="sm"
                value={75}
                color="success"
                label={
                  <span className="text-[10px] text-steel-500 font-bold">
                    PROGRESO DE ARMADO
                  </span>
                }
                showValueLabel={true}
                classNames={{ value: "text-[10px] font-bold" }}
              />
            </CardBody>
          </Card>

          <Card className="bg-white dark:bg-steel-950 border border-steel-100 dark:border-steel-800/50 shadow-none">
            <CardBody className="p-4 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm">Edificio San Martín</span>
                <Chip size="sm" color="warning" variant="flat">
                  Cotizando
                </Chip>
              </div>
              <Progress
                size="sm"
                value={30}
                color="warning"
                label={
                  <span className="text-[10px] text-steel-500 font-bold">
                    CÁLCULO DE OPTIMIZACIÓN
                  </span>
                }
                showValueLabel={true}
                classNames={{ value: "text-[10px] font-bold" }}
              />
            </CardBody>
          </Card>
        </div>
      </section>
    </div>
  );
}
