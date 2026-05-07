import { Card, CardBody, Button, Chip } from "@heroui/react";
import {
  FolderOpen,
  Package,
  Wrench,
  Palette,
  TrendingUp,
  ArrowUpRight,
  Calendar,
} from "lucide-react";
import { usePerfiles } from "@/hooks/catalogo/usePerfiles";
import { useAccesorios } from "@/hooks/catalogo/useAccesorios";
import { useTratamientos } from "@/hooks/catalogo/useTratamientos";
import { useOpciones } from "@/hooks/catalogo/useOpciones";
// import { useObras } from "@/hooks/useObras";
import { useLineas } from "@/hooks/catalogo/useLineas";
import { Obra } from "@/types";

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
  {
    id: 5,
    apellido: "Lopez",
    nombre: "Maria",
    direccion: "Av. Siempre Viva 745",
    telefono: "3584538695",
    ciudad: "Villa Maria",
  },
];
const dataVentas = [
  { name: "Ene", total: 4000 },
  { name: "Feb", total: 3000 },
  { name: "Mar", total: 5000 },
  { name: "Abr", total: 4500 },
];

const LINEA_COLORS = ["#db924b", "#334e68", "#627d98", "#4a7c59", "#8b5e3c"];

export default function InicioPage() {
  // const { data: obras = [] } = useObras();
  const { data: perfiles = [] } = usePerfiles();
  const { data: accesorios = [] } = useAccesorios();
  const { data: tratamientos = [] } = useTratamientos();
  const { data: opciones = [] } = useOpciones();
  const { data: lineas = [] } = useLineas();

  const nombre = opciones[0]?.nombre ?? "Usuario";

  // Distribución real por línea a partir de perfiles
  const dataLineas = lineas
    .map((l) => ({
      name: l.linea,
      value: perfiles.filter((p) => p.id_linea === l.id).length,
    }))
    .filter((l) => l.value > 0)
    .slice(0, 5);

  const stats = [
    {
      label: "Obras activas",
      value: obras.length,
      icon: FolderOpen,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-950/40",
    },
    {
      label: "Perfiles",
      value: perfiles.length,
      icon: Package,
      color: "text-steel-500",
      bg: "bg-steel-50 dark:bg-steel-900/40",
    },
    {
      label: "Accesorios",
      value: accesorios.length,
      icon: Wrench,
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-950/40",
    },
    {
      label: "Tratamientos",
      value: tratamientos.length,
      icon: Palette,
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Chip
            size="sm"
            variant="flat"
            className="mb-2 font-bold text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
          >
            Panel de Control
          </Chip>
          <h2 className="font-display text-4xl font-bold text-steel-800 dark:text-steel-100 tracking-tight">
            Buen día, {nombre}
          </h2>
          <p className="text-steel-500 dark:text-steel-400 mt-1 flex items-center gap-2 text-sm capitalize">
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

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <Card
            key={label}
            className="border border-steel-100 dark:border-steel-800/50 shadow-none bg-white dark:bg-steel-950"
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
              <div className={`p-3 rounded-2xl ${bg} ${color}`}>
                <Icon size={22} strokeWidth={2} />
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Área — fix: altura explícita en px, no % */}
        <Card className="lg:col-span-2 bg-white dark:bg-steel-950 border border-steel-100 dark:border-steel-800/50 shadow-none">
          <CardBody className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="text-steel-800 dark:text-steel-100 font-bold flex items-center gap-2 text-sm">
                  <TrendingUp className="text-emerald-500 w-4 h-4" />
                  Rendimiento de Proyectos
                </h4>
                <p className="text-xs text-steel-400 mt-0.5">
                  Volumen de cotizaciones mensuales
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-lg">
                +12.5%
              </span>
            </div>
            {/* ✅ altura fija en px — evita el error width(-1)/height(-1) */}
            <div style={{ width: "100%", height: 240 }}>
              {/* <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dataVentas}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="#db924b"
                        stopOpacity={0.25}
                      />
                      <stop offset="95%" stopColor="#db924b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#88888818"
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
                      fontSize: 12,
                    }}
                    itemStyle={{ color: "#db924b" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#db924b"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorTotal)"
                  />
                </AreaChart>
              </ResponsiveContainer> */}
            </div>
          </CardBody>
        </Card>

        {/* Pie — distribución real por línea */}

        <Card className="bg-white dark:bg-steel-950 border border-steel-100 dark:border-steel-800/50 shadow-none">
          <CardBody className="p-6">
            <h4 className="text-steel-800 dark:text-steel-100 font-bold text-sm mb-0.5">
              Mix de Producción
            </h4>
            <p className="text-xs text-steel-400 mb-4">Perfiles por línea</p>

            {dataLineas.length > 0 ? (
              <>
                {/* ✅ altura fija en px */}
                <div style={{ width: "100%", height: 180 }}>
                  {/* <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dataLineas}
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={6}
                        dataKey="value"
                      >
                        {dataLineas.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={LINEA_COLORS[index % LINEA_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#18181b",
                          border: "none",
                          borderRadius: "8px",
                          color: "#fff",
                          fontSize: 12,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer> */}
                </div>
                <div className="space-y-2 mt-3">
                  {dataLineas.map((item, index) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{
                            backgroundColor:
                              LINEA_COLORS[index % LINEA_COLORS.length],
                          }}
                        />
                        <span className="text-xs text-steel-600 dark:text-steel-300 truncate max-w-[100px]">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-xs font-bold font-mono text-steel-700 dark:text-steel-200">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-40 text-xs text-steel-400">
                Sin datos de perfiles
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
