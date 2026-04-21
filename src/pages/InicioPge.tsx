import { Link } from 'react-router-dom'
import { Card, CardBody } from '@heroui/react'
import {
  FolderOpen, Layers, BookOpen, Settings,
  TrendingUp, Package, Wrench, Palette
} from 'lucide-react'
import { useObrasStore } from '@/store/obrasStore'
import { useCatalogosStore } from '@/store/catalogosStore'

export default function InicioPge() {
  const obras       = useObrasStore(s => s.obras)
  const perfiles    = useCatalogosStore(s => s.perfiles)
  const accesorios  = useCatalogosStore(s => s.accesorios)
  const tratamientos = useCatalogosStore(s => s.tratamientos)
  const opciones    = useCatalogosStore(s => s.opciones)

  const stats = [
    { label: 'Obras activas',  value: obras.length,        icon: FolderOpen, to: '/obras',     color: 'text-blue-500' },
    { label: 'Perfiles',       value: perfiles.length,     icon: Package,    to: '/catalogos', color: 'text-steel-500' },
    { label: 'Accesorios',     value: accesorios.length,   icon: Wrench,     to: '/catalogos', color: 'text-amber-500' },
    { label: 'Tratamientos',   value: tratamientos.length, icon: Palette,    to: '/catalogos', color: 'text-emerald-500' },
  ]

  const accesos = [
    { to: '/obras',     icon: FolderOpen, label: 'Obras',     desc: 'Gestión de proyectos y presupuestos',     color: 'bg-blue-50 dark:bg-blue-950/30' },
    { to: '/productos', icon: Layers,     label: 'Productos', desc: 'Editor de tipologías y perfiles',         color: 'bg-steel-50 dark:bg-steel-900' },
    { to: '/catalogos', icon: BookOpen,   label: 'Catálogos', desc: 'Perfiles, vidrios, accesorios y más',    color: 'bg-amber-50 dark:bg-amber-950/30' },
    { to: '/opciones',  icon: Settings,   label: 'Opciones',  desc: 'IVA, márgenes, datos de empresa',        color: 'bg-emerald-50 dark:bg-emerald-950/20' },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-8 fade-in">
      {/* Bienvenida */}
      <div>
        <h2 className="font-display text-2xl font-700 text-steel-800 dark:text-steel-100">
          Bienvenido, {opciones.nombre}
        </h2>
        <p className="text-steel-500 dark:text-steel-400 mt-1 text-sm">
          Sistema de presupuestación para carpintería de aluminio
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, to, color }) => (
          <Link key={label} to={to}>
            <Card
              className="card-surface hover:shadow-md transition-shadow cursor-pointer"
              isPressable
            >
              <CardBody className="flex flex-row items-center gap-3 p-4">
                <div className={`p-2 rounded-lg bg-steel-50 dark:bg-steel-800`}>
                  <Icon className={`w-5 h-5 ${color}`} strokeWidth={1.8} />
                </div>
                <div>
                  <p className="text-2xl font-display font-700 text-steel-800 dark:text-steel-100 leading-none">
                    {value}
                  </p>
                  <p className="text-xs text-steel-400 mt-0.5">{label}</p>
                </div>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>

      {/* Accesos rápidos */}
      <div>
        <p className="section-label mb-3">Acceso rápido</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {accesos.map(({ to, icon: Icon, label, desc, color }) => (
            <Link key={to} to={to}>
              <Card
                className={`border border-steel-200 dark:border-steel-700 ${color} hover:shadow-md transition-shadow`}
                isPressable
              >
                <CardBody className="flex flex-row items-start gap-4 p-5">
                  <div className="p-2 rounded-lg bg-white dark:bg-steel-800 shadow-sm mt-0.5">
                    <Icon className="w-5 h-5 text-steel-600 dark:text-steel-300" strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="font-semibold text-steel-800 dark:text-steel-100">{label}</p>
                    <p className="text-xs text-steel-400 dark:text-steel-500 mt-0.5">{desc}</p>
                  </div>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
