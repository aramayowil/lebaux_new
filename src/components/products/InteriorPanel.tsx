import { useProductosStore } from '@/store/productosStore'
import InteriorEditor from './InteriorEditor'
import { Square, ChevronRight } from 'lucide-react'
import type { Interior } from '@/types'

interface Props {
  interior: Interior
  idHoja: number
  idMarco: number
  idProducto: number
}

export default function InteriorPanel({ interior, idHoja, idMarco, idProducto }: Props) {
  // FIX: se eliminó el tab "Accesorios" duplicado — InteriorEditor ya lo incluye internamente
  const { productos, marcos, hojas } = useProductosStore()

  const producto = productos.find(p => p.id === idProducto)
  const marco    = marcos.find(m => m.id === idMarco)
  const hoja     = hojas.find(h => h.id === idHoja)

  return (
    <div className="flex flex-col gap-0">
      {/* Cabecera breadcrumb */}
      <div className="flex items-center gap-2 px-4 py-3 bg-zinc-50 dark:bg-zinc-900 rounded-t-xl border border-b-0 border-zinc-200 dark:border-zinc-800 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
        <div className="w-1.5 h-5 rounded-full bg-purple-400 flex-shrink-0" />
        <span className="text-zinc-300 dark:text-zinc-600">{producto?.descripcion}</span>
        <ChevronRight className="w-3 h-3 text-zinc-300 dark:text-zinc-700" />
        <span className="text-zinc-300 dark:text-zinc-600">{marco?.descripcion}</span>
        <ChevronRight className="w-3 h-3 text-zinc-300 dark:text-zinc-700" />
        <span className="text-zinc-300 dark:text-zinc-600">{hoja?.descripcion}</span>
        <ChevronRight className="w-3 h-3 text-zinc-300 dark:text-zinc-700" />
        <Square className="w-3 h-3 text-purple-400" />
        <span className="text-purple-500">Interior</span>
      </div>

      {/* InteriorEditor (contiene secciones ①②③④ completas) */}
      <InteriorEditor interior={interior} />
    </div>
  )
}
