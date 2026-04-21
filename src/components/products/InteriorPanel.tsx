import { Square } from 'lucide-react'
import { useProductosStore } from '@/store/productosStore'
import InteriorEditor from './InteriorEditor'
import DespieceAccesoriosPanel from './DespieceAccesoriosPanel'
import { Tabs, Tab } from '@heroui/react'
import { useState } from 'react'
import type { Interior } from '@/types'

interface Props {
  interior: Interior
  idHoja: number
  idMarco: number
  idProducto: number
}

export default function InteriorPanel({ interior, idHoja, idMarco, idProducto }: Props) {
  const { productos, marcos, hojas, getDespieceInteriorByInterior, addDespieceInterior } = useProductosStore()
  const [tab, setTab] = useState('editor')

  const producto = productos.find(p => p.id === idProducto)
  const marco    = marcos.find(m => m.id === idMarco)
  const hoja     = hojas.find(h => h.id === idHoja)

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 flex-wrap text-xs text-steel-400">
        <span className="text-steel-600 dark:text-steel-300 font-medium">{producto?.descripcion}</span>
        <span>›</span>
        <span>{marco?.descripcion}</span>
        <span>›</span>
        <span>{hoja?.descripcion}</span>
        <span>›</span>
        <span className="font-semibold text-steel-800 dark:text-steel-100 flex items-center gap-1">
          <Square className="w-3.5 h-3.5" /> Interior
        </span>
      </div>

      {/* Tabs: editor completo + accesorios */}
      <Tabs selectedKey={tab} onSelectionChange={k => setTab(String(k))}
        size="sm" variant="underlined"
        classNames={{
          tabList: 'border-b border-steel-200 dark:border-steel-700 w-full gap-0',
          cursor: 'bg-steel-600 dark:bg-steel-400 h-0.5',
          tab: 'px-4 h-9 text-xs font-medium',
        }}>
        <Tab key="editor" title="Fórmulas y sub-elementos">
          <div className="mt-4">
            <InteriorEditor interior={interior} />
          </div>
        </Tab>
        <Tab key="accesorios" title="Accesorios del interior">
          <div className="mt-4 card-surface p-4">
            <DespieceAccesoriosPanel nivel="interior" idParent={interior.id} label="Accesorios del interior" />
          </div>
        </Tab>
      </Tabs>
    </div>
  )
}
